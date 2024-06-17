import "./App.css";
import { useTelegram } from "../../hooks/useTelegram";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

function App() {
  const serverUrl = "https://tg-bot-task-backend.onrender.com/";
  const { tg, onClose, user } = useTelegram();
  const [image, setImage] = useState("default");
  const [inputMsg, setInputMsg] = useState("");
  const [logs, setLogs] = useState("");

  useLayoutEffect(() => {
    tg.MainButton.setParams({
      text: "Задати питання",
    });
    tg.MainButton.hide();
    console.log("user", user);
  }, []);

  const onMainBtnClick = useCallback(async () => {
    setLogs(logs + "button pressed\n");

    const formData = new FormData();
    formData.append("image", image);
    let message = "";
    await fetch(`${serverUrl}upload`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        setLogs("fetch worked\n");
        return response.json();
      })
      .then((data) => {
        setLogs(logs + "data parsed\n");
        setLogs(logs + JSON.stringify(data));
        if (data.ok) {
          tg.sendData(JSON.stringify(data))
          return;
        } else {
          setInputMsg(data.message);
          return;
        }
      })
      .catch((error) => {
        setLogs(logs + "error caught\n");
        setInputMsg("Щось пішло не так... Спробуйте ще.");
        return;
      });

    return;
  }, []);

  useEffect(() => {
    tg.onEvent("mainButtonClicked", onMainBtnClick);
    return () => {
      tg.offEvent("mainButtonClicked", onMainBtnClick);
    };
  }, [onMainBtnClick]);

  useEffect(() => {
    if (image === "default") {
      setInputMsg("Тільки формати png та jpeg");
    } else if (!image) {
      setInputMsg("Помилка при завантаженні файлу :(");
      return;
    } else {
      setInputMsg(image.name);

      tg.MainButton.onClick = async () => {
        setLogs("button pressed\n");

        const formData = new FormData();
        formData.append("image", image);

        await fetch(`${serverUrl}upload`, {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            setLogs("fetch worked\n");
            response.json();
          })
          .then((data) => {
            setLogs("data parsed\n");
            setLogs(JSON.stringify(data));
            if (data.ok) {
              onClose();
            } else {
              setInputMsg(data.message);
            }
          })
          .catch((error) => {
            setLogs("error caught\n");
            setInputMsg("Щось пішло не так... Спробуйте ще.");
          });

        return;
      };
      tg.MainButton.show();
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
      <code style={{ marginTop: "10px" }}>
        there will be logs
        {logs}
      </code>
    </section>
  );
}

export default App;
