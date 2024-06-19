import "./App.css";
import { useTelegram } from "../../hooks/useTelegram";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

function App() {
  const serverUrl = "https://tg-bot-task-backend.onrender.com/";
  const { tg, onClose, user, queryId } = useTelegram();
  const [image, setImage] = useState("default");
  const [inputMsg, setInputMsg] = useState("");
  const [logs, setLogs] = useState("");

  useLayoutEffect(() => {
    tg.MainButton.setParams({
      text: "Задати питання",
    });
    tg.MainButton.hide();
    window.sendData = async () => {
      const formData = new FormData();
      formData.append("image", image);
      await fetch(`${serverUrl}upload`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data; boundary=jbasdjbfj"
        }
      }).then((response) => {
        setLogs(logs + "fetch worked<br>");
        console.log(response.json());
        return;
      }).catch(e => console.log(e));
    };
    console.log("user", user);
  }, []);

  const onMainBtnClick = useCallback(async () => {
    setLogs(logs + "button pressed<br>");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("queryId", queryId)
    let message = "";
    await fetch(`${serverUrl}upload`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        setLogs(logs + "fetch worked<br>");
        return response.json();
      })
      .then((data) => {
        setLogs(logs + "data parsed<br>");
        setLogs(logs + JSON.stringify(data) + "<br>");
        if (data.ok) {
          onClose()
          return;
        } else {
          setInputMsg(data.message);
          return;
        }
      })
      .catch((error) => {
        setLogs(logs + "error caught " + error);
        setInputMsg("Щось пішло не так... Спробуйте ще.");
        return;
      });

    return;
  }, [image]);

  useEffect(() => {
    tg.onEvent("mainButtonClicked", onMainBtnClick);
    return () => {
      tg.offEvent("mainButtonClicked", onMainBtnClick);
    };
  }, [onMainBtnClick]);

  useEffect(() => {
    if (image === "default") {
      setInputMsg("Тільки формати png та jpeg");
      tg.MainButton.hide();
    } else if (!image) {
      setInputMsg("Помилка при завантаженні файлу :(");
      tg.MainButton.hide();
      return;
    } else {
      setInputMsg(image.name);
      tg.MainButton.show();
      return;
    }
  }, [image]);

  const getImage = (e) => {
    console.dir(e.target.files[0]);
    const file = e.target.files[0];
    setImage(file);
    return;
  };

  return (
    <section>
      <p>Привіт, {user?.username || "користувачу"}!</p>
      <h1>Запитайте у ChatGPT</h1>
      <p>що зображено на картинці?</p>
      <label htmlFor="file-upload" className="custom-file-upload">
        Завантажити зображення
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/png, image/jpeg"
        onChange={getImage}
      />
      <span>{inputMsg}</span>
      <div style={{ marginTop: "10px" }}>
        there will be logs
        <br />
        {logs}
      </div>
    </section>
  );
}

export default App;
