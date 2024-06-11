import "./App.css";
import { useTelegram } from "../../hooks/useTelegram";

function App() {
  const { tg, onClose } = useTelegram();

  return (
    <section>
      <h1>Запитайте у ChatGPT</h1>
      <p>що зображено на картинці?</p>
      <label for="file-upload" className="custom-file-upload">
        Завантажити зображення
      </label>
      <input id="file-upload" type="file" />
    </section>
  );
}

export default App;
