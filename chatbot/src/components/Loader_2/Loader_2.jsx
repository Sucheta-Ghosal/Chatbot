import React from "react";
import "./Loader_2.css";

const Loader_2 = () => {
  return (
    <div className="solar-container">
      <div className="sun">☀️</div>

      {/* Venus */}
      <div className="orbit venus-orbit">
        <div className="planet">🟤</div>
      </div>

      {/* Earth */}
      <div className="orbit earth-orbit">
        <div className="planet">🌍</div>
      </div>

      {/* Mars */}
      <div className="orbit mars-orbit">
        <div className="planet">🔴</div>
      </div>

      {/* Jupiter */}
      <div className="orbit jupiter-orbit">
        <div className="planet">🟠</div>
      </div>

      {/* Saturn */}
      <div className="orbit saturn-orbit">
        <div className="planet">🪐</div>
      </div>

      

      <p className="loading-text">Exploring the universe...</p>
    </div>
  );
};

export default Loader_2;