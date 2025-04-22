import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Avatar() {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const handleChangePassword = () => {
    navigate("/change-password");
  };

  const handleLogOut = () => {
    navigate("/");
  };

  // Ẩn menu nếu click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={menuRef}
      style={{ position: "absolute", top: "20px", right: "30px" }}
    >
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWrLzlCvzW9PJ6RDf_dUMIeG2khQ6zFGKXFw&s"
        alt="User Avatar"
        onClick={() => setShowMenu(!showMenu)}
        style={{
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          cursor: "pointer",
          border: "2px solid #ccc",
        }}
      />
      {showMenu && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            right: "0",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
            zIndex: 10,
            minWidth: "160px",
          }}
        >
          <button style={{ width: "100%" }} onClick={handleChangePassword}>
            Đổi mật khẩu
          </button>
          <button style={{ width: "100%" }} onClick={handleLogOut}>
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}

export default Avatar;
