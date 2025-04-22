import { useState } from "react";
import { db } from "../config/firebase";
import { ref, push } from "firebase/database";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const newUser = { username, password };
      await push(ref(db, "account"), newUser);
      alert("Đăng ký thành công!");
      navigate("/"); // Chuyển về trang đăng nhập sau khi đăng ký
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      alert("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay} />
      <form onSubmit={handleRegister} style={styles.form}>
        <h2 style={styles.title}>🧯 Đăng ký tài khoản PCCC</h2>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Đăng ký
        </button>
        <p style={styles.linkText}>
          Đã có tài khoản?{" "}
          <Link to="/" style={styles.link}>
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    backgroundImage:
      "url('https://png.pngtree.com/background/20210711/original/pngtree-fire-safety-knowledge-fire-safety-exhibition-board-background-material-picture-image_1070407.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1,
  },
  form: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: "40px",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 0 25px rgba(255, 69, 0, 0.6)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    position: "relative",
    zIndex: 2,
  },
  title: {
    color: "#b22222",
    textAlign: "center",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    backgroundColor: "#ff4500",
    color: "white",
    fontWeight: "bold",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background 0.3s",
  },
  linkText: {
    textAlign: "center",
    fontSize: "14px",
  },
  link: {
    color: "#ff4500",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Register;
