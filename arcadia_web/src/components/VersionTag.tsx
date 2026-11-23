import { CODENAME, VERSION } from "../config/version";

export function VersionTag() {
  return (
    <div className="version">
      v{VERSION}: <b>{CODENAME}</b>
    </div>
  );
}