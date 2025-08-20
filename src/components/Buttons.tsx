import Close from "../assets/close.svg";
import Filter from "../assets/filter.svg";
import Info from "../assets/info.svg";
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
    <div className="control-button" onClick={onClick}>
      <img src={Search} />
    </div>
  );
}

export function FilterButton({ onClick }: { onClick: React.MouseEventHandler<HTMLDivElement> }) {
  return (
    <div className="control-button" onClick={onClick}>
      <img src={Filter} />
    </div>
  );
}

export function AboutButton({ onClick }: { onClick: React.MouseEventHandler<HTMLDivElement> }) {
  return (
    <div className="control-button" onClick={onClick}>
      <img src={Info} />
    </div>
  );
}
