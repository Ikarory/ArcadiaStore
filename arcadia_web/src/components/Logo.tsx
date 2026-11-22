import montanas from "../assets/montanas.txt?raw";

const ARTE = montanas.replace(/^\n+|\s+$/g, "");

export function Logo() {
  return (
    <header className="logo">
      <pre className="logo-arte">{ARTE}</pre>
      <h1 className="logo-lema">ARCADIA</h1>
      <div className="logo-nombre">la vieja utopía...</div>
      <div className="logo-credito">
        arte: autor desconocido ·{" "}
        <a href="https://www.asciiart.eu/art/7b24bf98d3e1d075" target="_blank" rel="noreferrer">
          asciiart.eu
        </a>
      </div>
    </header>
  );
}