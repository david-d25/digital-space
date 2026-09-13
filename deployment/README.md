# Deployment

The site runs on the VDS as a couple of containers behind the host's shared
nginx, which terminates TLS and proxies one subtree into the port published
here. Nothing is built on the server: CI builds the image, tags it with the
commit, and pushes it to GHCR — the server only pulls.

## One-time setup on the server

```sh
# A user that can talk to docker and owns nothing else.
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy

sudo install -d -o deploy -g deploy /srv/digital-space
```

Add the CI public key to `/home/deploy/.ssh/authorized_keys`.

Be clear-eyed about what that key can do: **membership of the `docker` group
is equivalent to root**, because anyone who can talk to the daemon can mount
the host filesystem into a container. A separate user keeps the deployment
tidy, it does not contain it. The honest ways to contain it are rootless
Docker, or a sudoers rule for the two compose commands and no docker group at
all — both worth doing if the box ever holds anything that matters.

Locking the key to a single command with `command=` in `authorized_keys` is
the usual next suggestion, but it does not fit this workflow as written: the
deploy also copies `compose.yaml` over with `scp`, and a forced command
blocks that. Going that route means keeping the compose file on the server
another way — a `git pull` inside the deploy script, say.

Then copy `.env.example` to `/srv/digital-space/.env` and fill it in. That
file is the only thing that differs between machines and the only place
secrets will live; it is not in git and CI never overwrites it.

## The host's nginx

One rule for the whole application. The prefix is *not* stripped: the app is
built knowing its own base path, and Next's `basePath` expects to see it.

```nginx
location /digital-space/ {
    proxy_pass         http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
}
```

Serving from the root of a domain instead: proxy `/` and leave `BASE_PATH`
empty everywhere.

## GitHub

Repository **variables** (Settings → Secrets and variables → Actions):

| | |
|---|---|
| `DEPLOY_HOST` | the VDS |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_PATH` | `/srv/digital-space` |
| `BASE_PATH` | `/digital-space`, or empty for a domain root |

Repository **secret**: `DEPLOY_KEY` — the private half of the key above.

Until `DEPLOY_HOST` is set the deploy job is skipped, so the build half works
from the first commit.

Nothing needs setting up for the registry itself: the workflow signs in to
GHCR with the token Actions already has. But the first push **creates the
package as private**, and the server has to be allowed to pull it. Two ways,
pick one:

- Make the package public — its Package settings → Change visibility. The
  image holds the built site, which is public anyway, and the server then
  needs no credentials at all.
- Or keep it private and sign in once on the server with a personal access
  token that has `read:packages`:
  `echo <token> | docker login ghcr.io -u <user> --password-stdin`.

This is the usual reason a first deploy fails with `denied` or
`manifest unknown`.

One more thing that can bite on a private repository: Settings → Actions →
General → Workflow permissions. If it is set to read-only, the `packages:
write` the workflow asks for is refused and the push fails.

## Deploying, and undeploying

Pushing to `master` does it. By hand, on the server:

```sh
cd /srv/digital-space
docker compose pull && docker compose up -d
```

Rolling back is the same with an older commit:

```sh
sed -i 's/^TAG=.*/TAG=<sha>/' .env && docker compose up -d
```

`BASE_PATH` is the one setting that is not only a run-time thing: it is
compiled into the frontend bundle, so changing it means rebuilding the image,
not just editing `.env`. Change the variable in GitHub and re-run the workflow.
