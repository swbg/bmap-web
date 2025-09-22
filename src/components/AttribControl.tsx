import Attrib from "../assets/attrib.svg";
import { AboutState } from "../const";

export default function AttribControl({
  hideAttrib,
  setHideAttrib,
  setShowAbout,
}: {
  hideAttrib: boolean | null;
  setHideAttrib: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAbout: React.Dispatch<React.SetStateAction<AboutState>>;
}) {
  const show = (a: AboutState) => {
    setHideAttrib(true);
    setShowAbout(a);
  };

  return (
    <div className="attrib-control">
      {!hideAttrib && (
        <div className="attrib-content">
          <a onClick={() => show(AboutState.Info)}>Info</a>{" "}
          <a onClick={() => show(AboutState.Imprint)}>Impressum</a>{" "}
          <a onClick={() => show(AboutState.Privacy)}>Datenschutz</a>
          {" | "}
          <a href="https://maplibre.org/" target="_blank">
            MapLibre
          </a>{" "}
          <a href="https://stadiamaps.com/" target="_blank">
            © Stadia Maps
          </a>{" "}
          <a href="https://openmaptiles.org/" target="_blank" rel="nofollow noopener noreferrer">
            © OpenMapTiles
          </a>{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank">
            © OpenStreetMap
          </a>
        </div>
      )}
      <div className="attrib-logo">
        <img src={Attrib} onClick={() => setHideAttrib((hideAttrib) => !hideAttrib)} />
      </div>
    </div>
  );
}
