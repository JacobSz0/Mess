import { NavLink } from "react-router-dom";
import { useToken } from "./Authentication.js";
import React, { useState, useEffect} from "react";

function Nav() {
  const { token, logout } = useToken();
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(token));


  useEffect(() => {
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }

  }, [token]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-success bg-gradient">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          Main
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!isLoggedIn && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/account">
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" onClick={logout}>
                    Logout
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
