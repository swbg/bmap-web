import { useState } from "react";
import { privacyText } from "../assets/about.ts";
import ChevronDown from "../assets/chevron-down.svg";
import ChevronUp from "../assets/chevron-up.svg";
import { dec } from "../utils";
import { AboutButton, CloseButton } from "./Buttons";

const ic = (import.meta.env.VITE_IC as string).split(",").map((c, i) => (
  <span key={i} style={{ display: "block" }}>
    {dec(c)}
  </span>
));

export default function AboutPanel({
  expand,
  setExpand,
}: {
  expand: boolean;
  setExpand: (b: boolean) => void;
}) {
  if (!expand) {
    return <AboutButton onClick={() => setExpand(true)} />;
  }

  enum About {
    None,
    Info,
    Imprint,
    Privacy,
  }
  const [expandAbout, setExpandAbout] = useState<About>(About.Info);

  return (
    <div className="control-panel about-panel">
      <CloseButton onClick={() => setExpand(false)} />
      <h4>Die kurze Durststrecke - Deine Community-App für München</h4>
      <div
        className="about-header"
        onClick={() => setExpandAbout((e) => (e !== About.Info ? About.Info : About.None))}
      >
        <img src={expandAbout === About.Info ? ChevronUp : ChevronDown} />
        Info
      </div>
      {expandAbout === About.Info && (
        <div className="about-content">
          <p>
            Mit der kurzen Durststrecke findest du schnell und unkompliziert die besten Durstlöscher
            in deiner Nähe - ob Trinkwasserbrunnen, Spätis, Bars, Kioske oder andere Anlaufstellen.
          </p>
          <p>
            Bitte beachte: Da sich Standorte, Angebote und Öffnungszeiten schnell ändern können,
            sind manche Angaben eventuell nicht immer auf dem neuesten Stand. Wir arbeiten
            kontinuierlich daran, die Daten aktuell zu halten und freuen uns über jeden Hinweis aus
            der Community.
          </p>
        </div>
      )}
      <div
        className="about-header"
        onClick={() => setExpandAbout((e) => (e !== About.Imprint ? About.Imprint : About.None))}
      >
        <img src={expandAbout === About.Imprint ? ChevronUp : ChevronDown} />
        Impressum
      </div>
      {expandAbout === About.Imprint && (
        <div className="about-content">
          <p>{ic}</p>
        </div>
      )}
      <div
        className="about-header"
        onClick={() => setExpandAbout((e) => (e !== About.Privacy ? About.Privacy : About.None))}
      >
        <img src={expandAbout === About.Privacy ? ChevronUp : ChevronDown} />
        Datenschutzerklärung
      </div>
      {expandAbout === About.Privacy && (
        <div className="about-content">
          {privacyText.map((c, i) => (
            <p key={i}>{i === 2 ? ic : c}</p>
          ))}
        </div>
      )}
    </div>
  );
}
