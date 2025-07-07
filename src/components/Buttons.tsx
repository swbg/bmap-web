import Close from "../assets/close.svg";
import Filter from "../assets/search.svg";
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
    <div className="filter-button" onClick={onClick}>
      <img src={Filter} />
    </div>
  );
}
