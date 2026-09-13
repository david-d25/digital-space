import Panel from '@/components/Panel/Panel';
import ContactRow from '@/components/ContactRow/ContactRow';
import Shine from '@/components/Shine/Shine';
import ShineTarget from '@/components/Shine/ShineTarget';
import {useTheme} from '@/components/ThemeProvider/ThemeProvider';
import {contacts} from '@/data/contacts';

import style from './IntroPanel.module.scss';

export default function IntroPanel() {
    const {theme, toggleTheme} = useTheme();

    return (
        <Panel size="large" className={style.intro}>
            <div className={style.eyebrow}>David&rsquo;s digital space</div>
            <div>
                <h1 className={style.name}>David</h1>
                <p className={style.tagline}>Java &amp; Web developer</p>
            </div>
            {/* Settings come from `DEFAULT_SHINE_PARAMS`, which is where the
              * tuned values live; pass `options` here only to differ from them. */}
            <Shine className={style.rows}>
                {contacts.map(contact => (
                    <ShineTarget wrap key={contact.label}>
                        <ContactRow
                            label={contact.label}
                            value={contact.value}
                            href={contact.href}
                        />
                    </ShineTarget>
                ))}
                <ContactRow
                    label="Theme"
                    value={theme === 'dark' ? 'Light' : 'Dark'}
                    valueIsClientOnly
                    variant="quiet"
                    onClick={toggleTheme}
                />
            </Shine>
        </Panel>
    );
}
