import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/training">Training Log</Link>
      <Link to="/ai">AI Insights</Link>
    </nav>
  );
}

export default Navbar;