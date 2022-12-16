import { NextPage } from "next";

// wallet SDK helpers
import NavbarProduction from "./NavbarProduction";
import NavbarPrelaunch from "./NavbarPrelaunch";

const Navbar: NextPage = () => {
  const appMode = process.env.NEXT_PUBLIC_APP_MODE;

  return (
    <div>
      {appMode == "prelaunch" ? <NavbarPrelaunch /> : <NavbarProduction />}
    </div>
  );
};

export default Navbar;
