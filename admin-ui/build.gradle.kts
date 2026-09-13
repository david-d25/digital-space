import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("base")
    id("com.github.node-gradle.node") version "3.5.1"
}

repositories {
    mavenCentral()
}

node {
    version.set("24.20.0") // todo take from package.json?
    npmVersion.set("11.19.0") // todo take from package.json?
    download.set(true)
}

tasks.replace("build", NpmTask::class)
tasks.named<NpmTask>("build") {
    dependsOn("npmInstall")
    args.set(listOf("run", "build"))
}

tasks.clean {
    delete += listOf(
        "build",
        ".next"
    )
}