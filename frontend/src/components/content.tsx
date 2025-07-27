import RightBox from "./rightbox";
import { Sidenav } from "./sidenav";

export function Content() {
  return (
    <>
      <div style={{ display: "flex" }}>
        <RightBox />
        <Sidenav />
      </div>
    </>
  );
}
