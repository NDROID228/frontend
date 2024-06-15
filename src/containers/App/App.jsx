import "./App.css";
import { useTelegram } from "../../hooks/useTelegram";
import { useEffect, useLayoutEffect, useState } from "react";
import axios from "axios";

function App() {
  const { tg, onClose, user } = useTelegram();
  const [image, setImage] = useState("default");
  const [inputMsg, setInputMsg] = useState("");

  useLayoutEffect(() => {
    tg.MainButton.setParams({
      text: "Задати питання",
    });
    tg.MainButton.hide();
    console.log("user", user);
  }, []);

  useEffect(() => {
    if (image === "default") {
      setInputMsg("Тільки формати png та jpeg");
    } else if (!image) {
      setInputMsg("Помилка при завантаженні файлу :(");
      return;
    } else {
      setInputMsg(image.name);
      tg.MainButton.onClick = async () => {
        const formData = new FormData();
        console.log(image);
        formData.append("image", image);
  
        
        await fetch("http://localhost:5000/upload", {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.ok) {
            onClose()
          } else {
            setInputMsg(data.message)
          }
        })
        .catch(error => setInputMsg('Щось пішло не так... Спробуйте ще.'));
  
        return;
      };
      tg.MainButton.show();
    }

    console.log(image);
  }, [image]);

  const getImage = (e) => {
    console.dir(e.target.files[0]);
    const file = e.target.files[0];
    setImage(file);
    return;
  };

  return (
    <section>
      <p>Привіт, {user.username}</p>
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
    </section>
  );
}

export default App;
