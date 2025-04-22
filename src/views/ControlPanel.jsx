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

  // Cập nhật bật/tắt quạt và máy bơm
  const handleUpdateDevice = async (device, value) => {
    try {
      await set(ref(db, `control/${device}`), value);

      if (value == true) {
        value = "bật";
      } else {
        value = "tắt";
      }

      await push(ref(db, "logs"), {
        timestamp: new Date().toLocaleString(),
        message: `${device} đã được ${value}`,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật hoặc ghi log:", error);
    }
  };

  // Cập nhật trạng thái hệ thống
  const handleUpdateState = async (value) => {
    try {
      await set(ref(db, `system/state`), value);

      await push(ref(db, "logs"), {
        timestamp: new Date().toLocaleString(),
        message: `Trạng thái hệ thống đã được chuyển sang ${value}`,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật hoặc ghi log:", error);
    }
  };

  // Cập nhật ngưỡng cảm biến
  const handleUpdateThresholds = async (e) => {
    e.preventDefault();

    try {
      await set(ref(db, "/system/config/thresholds/gas"), Number(gasThreshold));
      await set(
        ref(db, "/system/config/thresholds/flame"),
        Number(flameThreshold)
      );

      // Ghi log sau khi cập nhật
      await push(ref(db, "logs"), {
        timestamp: new Date().toLocaleString(),
        message: `Đã cập nhật ngưỡng: Gas = ${gasThreshold}, Flame = ${flameThreshold}`,
      });

      alert("✅ Cập nhật và lưu log thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật hoặc ghi log:", error);
    }
  };

  // Lấy trạng thái thiết bị
  useEffect(() => {
    const fanRef = ref(db, "control/fan");
    const pumpRef = ref(db, "control/pump");
    const statusRef = ref(db, "system/state");
    const gasRef = ref(db, "sensors/gas_value");
    const flameRef = ref(db, "sensors/flame_value");
    const logsRef = ref(db, "logs");
    const gasThresholdRef = ref(db, "system/config/thresholds/gas");
    const flameThresholdRef = ref(db, "system/config/thresholds/flame");

    onValue(fanRef, (snapshot) => setFan(snapshot.val() || false));
    onValue(pumpRef, (snapshot) => setPump(snapshot.val() || false));
    onValue(statusRef, (snapshot) => setStatus(snapshot.val() || 0));
    onValue(gasRef, (snapshot) => setGasValue(snapshot.val() || 0));
    onValue(flameRef, (snapshot) => setFlameValue(snapshot.val() || 0));
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const logsArray = Object.values(data).reverse();
      setLogs(logsArray);
    });
    onValue(gasThresholdRef, (snapshot) =>
      setGasThreshold(snapshot.val() || 0)
    );
    onValue(flameThresholdRef, (snapshot) =>
      setFlameThreshold(snapshot.val() || 0)
    );
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🚨 Bảng điều khiển hệ thống PCCC</h1>

      <div style={{ display: "flex", gap: "4%" }}>
        <div style={styles.section50}>
          <h3 style={styles.header_child}>⚙️ Thiết bị điều khiển</h3>
          <button
            onClick={() => handleUpdateDevice("fan", !fan)}
            style={styles.button}
          >
            Quạt: {fan ? "Bật" : "Tắt"}
          </button>
          <button
            onClick={() => handleUpdateDevice("pump", !pump)}
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
              onClick={() => handleUpdateState(val)}
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

      <div style={{ display: "flex", gap: "4%" }}>
        <div style={styles.section50}>
          <h3 style={styles.header_child}>📡 Dữ liệu cảm biến</h3>
          <p>
            Gas Value: <strong>{gasValue}</strong>
          </p>
          <p>
            Flame:{" "}
            <strong>
              {flameValue > flameThreshold
                ? `${flameValue}  🔥 Có lửa`
                : `${flameValue}  ✅ An toàn`}
            </strong>
          </p>
        </div>
        <div style={styles.section50}>
          <form onSubmit={handleUpdateThresholds}>
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
