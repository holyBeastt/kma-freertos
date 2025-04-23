import { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { ref, set, onValue, push } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Avatar from "../components/avatar";
import { Link } from "react-router-dom";
import { useSensor } from "../components/SensorContext";

function ControlPanel() {
  const [fan, setFan] = useState(0);
  const [pump, setPump] = useState(0);
  const [status, setStatus] = useState(0);
  const [gasValue, setGasValue] = useState(0);
  const [flameValue, setFlameValue] = useState(0);
  const [logs, setLogs] = useState([]);
  const [gasThreshold, setGasThreshold] = useState(300);
  const [flameThreshold, setFlameThreshold] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [alarmCheckDelay, setAlarmCheckDelay] = useState(10); // ví dụ mặc định là 10 giây

  const { setGasValue: setGasCtxValue, setFlameValue: setFlameCtxValue } =
    useSensor();

  // Cập nhật bật/tắt quạt và máy bơm
  const handleUpdateDevice = async (device, value) => {
    try {
      let messLog;
      if (value == true) {
        value = 1;
        messLog = `${device} đã được bật`;
      } else {
        value = 0;
        messLog = `${device} đã được tắt`;
      }

      await set(ref(db, `control/${device}`), value);

      await push(ref(db, "logs"), {
        timestamp: Math.floor(Date.now() / 1000), // <-- chuyển sang epoch time (giây)
        eventType: messLog,
      });

      toast.success(`🚀 ${messLog}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật hoặc ghi log:", error);
    }
  };

  // Cập nhật trạng thái hệ thống
  const handleUpdateState = async (value) => {
    try {
      await set(ref(db, `system/state`), value);

      await push(ref(db, "logs"), {
        timestamp: Math.floor(Date.now() / 1000), // <-- chuyển sang epoch time (giây)
        message: `Trạng thái hệ thống đã được chuyển sang ${value}`,
      });

      toast.success(`Trạng thái hệ thống đã được chuyển sang ${value}`);
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
      await set(
        ref(db, "/system/config/alarmCheckDelay"),
        Number(alarmCheckDelay * 1000)
      );

      // Ghi log sau khi cập nhật
      await push(ref(db, "logs"), {
        timestamp: Math.floor(Date.now() / 1000), // <-- chuyển sang epoch time (giây)
        message: `Đã cập nhật ngưỡng: Gas = ${gasThreshold}, Flame = ${flameThreshold}, t/g tự động = ${alarmCheckDelay} giây`,
      });

      toast.success(
        `Đã cập nhật ngưỡng: Gas = ${gasThreshold}, Flame = ${flameThreshold}, t/g tự động = ${alarmCheckDelay} giây`
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật hoặc ghi log:", error);
    }
  };

  function formatVNTime(epochSeconds) {
    if (!epochSeconds) return "";
    const date = new Date(epochSeconds * 1000); // chuyển từ giây → mili giây
    return date.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  }

  // Lấy trạng thái thiết bị
  useEffect(() => {
    const fanRef = ref(db, "control/fan"); // Tắt bật quạt
    const pumpRef = ref(db, "control/pump"); // Tắt bật bơm
    const statusRef = ref(db, "system/state"); // Lấy, chỉnh sửa trạng thái hệ thống
    const gasRef = ref(db, "sensors/gas_value"); // Lấy giá trị gas
    const flameRef = ref(db, "sensors/flame_value"); // Lấy giá trị lửa
    const logsRef = ref(db, "logs"); // Ghi log
    const gasThresholdRef = ref(db, "system/config/thresholds/gas"); // Lấy, chỉnh sửa ngưỡng gas
    const flameThresholdRef = ref(db, "system/config/thresholds/flame"); // Lấy, chỉnh sửa ngưỡng lửa
    const alarmCheckDelayRef = ref(db, "system/config/alarmCheckDelay"); // Lấy thời gian tự động chữa cháy

    onValue(fanRef, (snapshot) => setFan(snapshot.val() || 0));
    onValue(pumpRef, (snapshot) => setPump(snapshot.val() || 0));
    onValue(statusRef, (snapshot) => setStatus(snapshot.val() || 0));
    // onValue(gasRef, (snapshot) => setGasValue(snapshot.val() || 0));
    // onValue(flameRef, (snapshot) => setFlameValue(snapshot.val() || 0));
    onValue(gasRef, (snapshot) => {
      const val = snapshot.val() || 0;
      setGasValue(val); // cập nhật trong trang
      setGasCtxValue(val); // cập nhật global context
    });

    onValue(flameRef, (snapshot) => {
      const val = snapshot.val() || 0;
      setFlameValue(val); // local
      setFlameCtxValue(val); // context
    });

    onValue(logsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const logsArray = Object.values(data)
        .map((log) => ({
          ...log,
          timestamp: formatVNTime(log.timestamp),
        }))
        .reverse();
      setLogs(logsArray);
    });

    onValue(gasThresholdRef, (snapshot) =>
      setGasThreshold(snapshot.val() || 0)
    );
    onValue(flameThresholdRef, (snapshot) =>
      setFlameThreshold(snapshot.val() || 0)
    );
    onValue(alarmCheckDelayRef, (snapshot) => {
      const val = snapshot.val();
      setAlarmCheckDelay(typeof val === "number" ? val / 1000 : 0);
    });
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes blinker {
        50% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      <div style={styles.container}>
        <h1 style={styles.header}>🚨 Bảng điều khiển hệ thống PCCC</h1>
        <Avatar showMenu={showMenu} setShowMenu={setShowMenu} />

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
          <div style={{ ...styles.section50, display: "flex" }}>
            <div style={{ width: "60%" }}>
              <h3 style={styles.header_child}>📡 Dữ liệu cảm biến</h3>

              <div style={styles.sensorRow}>
                <span style={styles.label}>Gas Value:</span>
                <strong
                  style={
                    gasValue > gasThreshold
                      ? { ...styles.alert, ...styles.blink }
                      : styles.safe
                  }
                >
                  {gasValue}{" "}
                  {gasValue > gasThreshold ? "🔴 Cảnh báo" : "🟢 An toàn"}
                </strong>
              </div>

              <div style={styles.sensorRow}>
                <span style={styles.label}>Flame:</span>
                <strong
                  style={
                    flameValue > flameThreshold
                      ? { ...styles.alert, ...styles.blink }
                      : styles.safe
                  }
                >
                  {flameValue > flameThreshold
                    ? `${flameValue} 🔥 Có lửa`
                    : `${flameValue} ✅ Không có lửa`}
                </strong>
              </div>

              <p style={styles.timestamp}>
                🕒 Cập nhật lúc: {new Date().toLocaleTimeString()}
              </p>
            </div>

            <div>
              <Link
                to="/Chart"
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#007BFF",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "14px",
                  lineHeight: "150px",
                }}
              >
                Xem biểu đồ 📈
              </Link>
            </div>
          </div>

          <div style={styles.section50}>
            <form onSubmit={handleUpdateThresholds}>
              <h4 style={styles.header_child}>⚙️ Cập nhật ngưỡng cảnh báo</h4>
              <div style={styles.inputGroup}>
                <div style={styles.inputItem}>
                  <label style={styles.label}>Ngưỡng Gas:</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={gasThreshold}
                    onChange={(e) => setGasThreshold(e.target.value)}
                  />
                </div>
                <div style={styles.inputItem}>
                  <label style={styles.label}>Ngưỡng Lửa:</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={flameThreshold}
                    onChange={(e) => setFlameThreshold(e.target.value)}
                  />
                </div>
                <div style={{ ...styles.inputItem, position: "relative" }}>
                  <label style={{ ...styles.label, width: "300px" }}>
                    T/g tự động chữa cháy:
                  </label>
                  <input
                    type="number"
                    style={{
                      ...styles.input,
                      paddingRight: "40px",
                      width: "100px",
                    }}
                    value={alarmCheckDelay}
                    onChange={(e) => setAlarmCheckDelay(e.target.value)}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "58px",
                      top: "73%",
                      transform: "translateY(-50%)",
                      color: "#555",
                    }}
                  >
                    giây
                  </span>
                </div>
              </div>
              <button type="submit" style={styles.formButton}>
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
                [{log.timestamp}] {log.eventType}
              </div>
            ))}
          </div>
        </div>
      </div>
      <ToastContainer autoClose={2000} />
    </>
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
    color: "#2d3436",
    fontSize: "20px",
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
    backgroundColor: "#f1f2f6",
    padding: "12px",
    height: "200px",
    overflowY: "auto",
    border: "1px solid #dcdde1",
    borderRadius: "8px",
    fontSize: "14px",
  },
  logItem: {
    borderBottom: "1px solid #dfe6e9",
    padding: "6px 0",
    color: "#2d3436",
  },

  inputGroup: {
    display: "flex",
    gap: "20px",
    marginBottom: "15px",
    flexWrap: "wrap",
  },
  inputItem: {
    display: "flex",
    flexDirection: "column",
    width: "150px",
  },
  label: {
    fontWeight: "bold",
    marginBottom: "6px",
    color: "#2d3436",
  },
  input: {
    padding: "10px",
    fontSize: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    transition: "border-color 0.3s ease",
  },
  formButton: {
    backgroundColor: "#00b894",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
  },

  // CSS cảnh báo
  sensorRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
    gap: "10px",
    fontSize: "16px",
  },

  alert: {
    color: "#e74c3c",
    fontWeight: "bold",
  },

  safe: {
    color: "#27ae60",
    fontWeight: "bold",
  },

  timestamp: {
    fontSize: "13px",
    color: "#888",
    marginTop: "10px",
  },

  // 👇 Hiệu ứng nhấp nháy (blink đỏ)
  blink: {
    animation: "blinker 1s linear infinite",
  },
};

export default ControlPanel;
