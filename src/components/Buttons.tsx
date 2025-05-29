import Close from "../assets/close.svg";
import Search from "../assets/search.svg";

export function CloseButton({ onClick }: { onClick: React.MouseEventHandler<HTMLDivElement> }) {
  return (
    <div className="close-button" onClick={onClick}>
      <img src={Close} />
    </div>
  );
}

export function SearchButton({ onClick }: { onClick: React.MouseEventHandler<HTMLDivElement> }) {
  return (
    <div className="search-button" onClick={onClick}>
      <img src={Search} />
    </div>
  );
}
