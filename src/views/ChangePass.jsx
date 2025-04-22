import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get, update } from "firebase/database";
import Swal from "sweetalert2";

function ChangePass() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("❌ Mật khẩu xác nhận không khớp.");
      setSuccess("");
      return;
    }

    const db = getDatabase();

    // Lấy user từ localStorage
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser || !localUser.username) {
      alert("Không tìm thấy người dùng trong localStorage.");
      return;
    }

    if (currentPassword !== localUser.password) {
      setError("❌ Mật khẩu cũ không chính xác.");
      setSuccess("");
      return;
    }

    try {
      const snapshot = await get(ref(db, "account"));
      const data = snapshot.val();

      for (const [accountId, user] of Object.entries(data || {})) {
        if (user.username === localUser.username) {
          const userRef = ref(db, `account/${accountId}`);

          await update(userRef, {
            password: newPassword,
          });

          Swal.fire({
            title: "Thành công!",
            text: "Đổi mật khẩu thành công",
            icon: "success",
            confirmButtonText: "OK",
          });
          navigate("/control");
          return;
        }
      }

      alert("Không tìm thấy tài khoản.");
    } catch (error) {
      console.error("Lỗi khi đổi mật khẩu:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          ← Quay lại
        </button>
        <div style={styles.card}>
          <h2 style={styles.title}>🔐 Đổi mật khẩu</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Mật khẩu hiện tại</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
            <button type="submit" style={styles.button}>
              Xác nhận
            </button>
          </form>
        </div>
      </div>
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  backBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer",
  },
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    textAlign: "center",
    color: "#b30000",
    marginBottom: "20px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    color: "#333",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#b30000",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    color: "red",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  success: {
    color: "green",
    marginBottom: "10px",
    fontWeight: "bold",
  },
};

export default ChangePass;
