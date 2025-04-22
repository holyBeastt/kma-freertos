import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { ref, set, onValue, push } from "firebase/database";

function ControlPanel() {
  const [fan, setFan] = useState(false);
  const [pump, setPump] = useState(false);
  const [status, setStatus] = useState(0);
  const [gasValue, setGasValue] = useState(0);
  const [flameValue, setFlameValue] = useState(false);
  const [logs, setLogs] = useState([]);
  const [gasThreshold, setGasThreshold] = useState(300);
  const [flameThreshold, setFlameThreshold] = useState(1);

  // Ghi trạng thái
  const updateDevice = async (device, value) => {
    await set(ref(db, `control/${device}`), value);
    await push(ref(db, "logs"), {
      timestamp: new Date().toLocaleString(),
      message: `${device} set to ${value}`,
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Gửi threshold mới về server hoặc lưu lại tuỳ logic bạn
    console.log("Ngưỡng Gas:", gasThreshold);
    console.log("Ngưỡng Lửa:", flameThreshold);
    // Có thể thêm logic gọi API để lưu lại giá trị
  };

  // Lấy trạng thái thiết bị
  useEffect(() => {
    const fanRef = ref(db, "control/fan");
    const pumpRef = ref(db, "control/pump");
    const statusRef = ref(db, "control/setState");
    const gasRef = ref(db, "sensors/gas_value");
    const flameRef = ref(db, "sensors/flame_value");
    const logsRef = ref(db, "logs");

    onValue(fanRef, (snapshot) => setFan(snapshot.val() || false));
    onValue(pumpRef, (snapshot) => setPump(snapshot.val() || false));
    onValue(statusRef, (snapshot) => setStatus(snapshot.val() || 0));
    onValue(gasRef, (snapshot) => setGasValue(snapshot.val() || 0));
    onValue(flameRef, (snapshot) => setFlameValue(snapshot.val() || false));
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const logsArray = Object.values(data).reverse();
      setLogs(logsArray);
    });
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🚨 Bảng điều khiển hệ thống PCCC</h1>

      <div style={{ display: "flex", gap: "4%" }}>
        <div style={styles.section50}>
          <h3 style={styles.header_child}>⚙️ Thiết bị điều khiển</h3>
          <button
            onClick={() => updateDevice("fan", !fan)}
            style={styles.button}
          >
            Quạt: {fan ? "Bật" : "Tắt"}
          </button>
          <button
            onClick={() => updateDevice("pump", !pump)}
            style={styles.button}
          >
            Bơm: {pump ? "Bật" : "Tắt"}
          </button>
        </div>

        <div style={styles.section50}>
          <h3 style={styles.header_child}>🚦 Trạng thái hệ thống</h3>
          {[0, 1, 2].map((val) => (
            <button
              key={val}
              onClick={() => updateDevice("setState", val)}
              style={{
                ...styles.button,
                backgroundColor: status === val ? "#ff4500" : "#ccc",
              }}
            >
              Trạng thái {val}
            </button>
          ))}
        </div>
      </div>

      {/* <div style={styles.section}>
        <h3>📡 Dữ liệu cảm biến</h3>
        <p>
          Gas Value: <strong>{gasValue}</strong>
        </p>
        <p>
          Flame: <strong>{flame ? "🔥 Có lửa" : "✅ An toàn"}</strong>
        </p>
      </div> */}

      <div style={{ display: "flex", gap: "4%" }}>
        <div style={styles.section50}>
          <h3 style={styles.header_child}>📡 Dữ liệu cảm biến</h3>
          <p>
            Gas Value: <strong>{gasValue}</strong>
          </p>
          <p>
            Flame:{" "}
            <strong>
              {flameValue > flameThreshold ? "🔥 Có lửa" : "✅ An toàn"}
            </strong>
          </p>
        </div>
        <div style={styles.section50}>
          <form onSubmit={handleUpdate}>
            <h4 style={styles.header_child}>⚙️ Cập nhật ngưỡng cảnh báo</h4>
            <div>
              <label>Ngưỡng Gas: </label>
              <input
                type="number"
                value={gasThreshold}
                onChange={(e) => setGasThreshold(e.target.value)}
              />
            </div>
            <div>
              <label>Ngưỡng Lửa: </label>
              <input
                type="number"
                value={flameThreshold}
                onChange={(e) => setFlameThreshold(e.target.value)}
              />
            </div>
            <button type="submit" style={{ marginTop: "0.5rem" }}>
              Cập nhật
            </button>
          </form>
        </div>
      </div>

      <div style={styles.section100}>
        <h3 style={styles.header_child}>📝 Nhật ký hoạt động</h3>
        <div style={styles.logBox}>
          {logs.map((log, idx) => (
            <div key={idx} style={styles.logItem}>
              [{log.timestamp}] {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#fff3f3",
    minHeight: "100vh",
    fontFamily: "Arial",
  },
  header: {
    textAlign: "center",
    color: "#b22222",
    marginBottom: "70px",
  },
  header_child: {
    marginBottom: "20px",
  },
  section50: {
    marginBottom: "30px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(255, 69, 0, 0.3)",
    width: "50%",
  },
  section100: {
    marginBottom: "30px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(255, 69, 0, 0.3)",
  },
  button: {
    marginRight: "10px",
    padding: "10px 20px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#ff6347",
    color: "#fff",
    cursor: "pointer",
  },
  logBox: {
    backgroundColor: "#f9f9f9",
    padding: "10px",
    height: "200px",
    overflowY: "auto",
    border: "1px solid #ddd",
    borderRadius: "6px",
  },
  logItem: {
    fontSize: "14px",
    borderBottom: "1px solid #eee",
    padding: "4px 0",
  },
};

export default ControlPanel;
