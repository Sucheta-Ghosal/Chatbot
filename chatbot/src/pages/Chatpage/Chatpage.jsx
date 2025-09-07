import Sidebar from "../../components/Sidebar/Sidebar";
import Main from "../../components/Main/Main";
import "./Chatpage.css";

export default function Chatpage() {
  return (
    <div className="chatpage-layout">
      <Sidebar />
      <Main />
    </div>
  );
}
