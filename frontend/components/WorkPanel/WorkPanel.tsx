import Panel from '@/components/Panel/Panel';
import SectionHeading from '@/components/SectionHeading/SectionHeading';
import ProjectCard from '@/components/ProjectCard/ProjectCard';
import Shine from '@/components/Shine/Shine';
import ShineTarget from '@/components/Shine/ShineTarget';
import ExternalLinkIcon from '@/icons/external-link.svg';
import {githubUser} from '@/data/contacts';
import {featuredProject, projects} from '@/data/projects';

import style from './WorkPanel.module.scss';

export default function WorkPanel() {
    return (
        <Panel as="section" id="work" className={style.work}>
            <SectionHeading
                title="Highlighted projects"
                meta={
                    <a
                        className={style.metaLink}
                        href={`https://github.com/${githubUser}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        GitHub
                        <ExternalLinkIcon className={style.metaIcon} aria-hidden="true"/>
                    </a>
                }
            />
            <Shine>
                <ShineTarget wrap>
                    <ProjectCard {...featuredProject} size="large" className={style.featured}/>
                </ShineTarget>
                <div className={style.projects}>
                    {projects.map(project => (
                        <ShineTarget wrap key={project.href}>
                            <ProjectCard {...project}/>
                        </ShineTarget>
                    ))}
                </div>
            </Shine>
        </Panel>
    );
}
