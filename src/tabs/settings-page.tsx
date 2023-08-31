import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";

import "./settings-style.css";

import TimePicker from "~components/time-picker";

const BlockList = () => {
  const storage = new Storage(); // ref
  const [blockedPages, setBlockedPages] = useState([]);
  const [newPage, setNewPage] = useState("");

  useEffect(() => {
    const loadPages = async () => {
      const blockedPagesData = await storage.get("blocked");
      console.log("obj:", blockedPagesData);
      console.log("objParsed:", JSON.parse(blockedPagesData));
      setBlockedPages(JSON.parse(blockedPagesData));
    };

    loadPages();
  }, []);

  const handleAddPage = async () => {
    const updatedBlockedPages = [...blockedPages, newPage];
    setBlockedPages(updatedBlockedPages);
    await storage.set("blocked", JSON.stringify(updatedBlockedPages));
    setNewPage("");
  };

  const handleDeletePage = async (index) => {
    const updatedBlockedPages = [...blockedPages];
    updatedBlockedPages.splice(index, 1);
    setBlockedPages(updatedBlockedPages);
    await storage.set("blocked", JSON.stringify(updatedBlockedPages));
  };

  return (
    <div>
      <h2>Blocked list</h2>
      <div className="input_bar">
        <div className="input-wrapper">
          <input
            type="text"
            value={newPage}
            placeholder="e.g. reddit.com..."
            onChange={(e) => setNewPage(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="input-hint"
            viewBox="0 0 16 16">
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm9.354 5.354-6 6a.5.5 0 0 1-.708-.708l6-6a.5.5 0 0 1 .708.708z" />
          </svg>
        </div>
        <button className="add-btn" onClick={handleAddPage}>
          <span className="add-btn-text">Add</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#ffffff"
            viewBox="0 0 256 256">
            <path d="M32,72V56a8,8,0,0,1,8-8H216a8,8,0,0,1,8,8V72a8,8,0,0,1-8,8H40A8,8,0,0,1,32,72Zm8,72H216a8,8,0,0,0,8-8V120a8,8,0,0,0-8-8H40a8,8,0,0,0-8,8v16A8,8,0,0,0,40,144Zm112,32H40a8,8,0,0,0-8,8v16a8,8,0,0,0,8,8H152a8,8,0,0,0,8-8V184A8,8,0,0,0,152,176Zm80,8H216V168a8,8,0,0,0-16,0v16H184a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V200h16a8,8,0,0,0,0-16Z"></path>
          </svg>
        </button>
      </div>
      <div className="blocked_list_flexcol">
        {blockedPages.map((page, index) => (
          <div key={index} className="blocked-list-entry">
            <span className="blocked-list-entry-text">{page}</span>
            <button className="del-btn" onClick={() => handleDeletePage(index)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 256 256">
                <path d="M225,80.4,183.6,39a24,24,0,0,0-33.94,0L31,157.66a24,24,0,0,0,0,33.94l30.06,30.06A8,8,0,0,0,66.74,224H216a8,8,0,0,0,0-16h-84.7L225,114.34A24,24,0,0,0,225,80.4ZM213.67,103,160,156.69,107.31,104,161,50.34a8,8,0,0,1,11.32,0l41.38,41.38a8,8,0,0,1,0,11.31Z"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <h2>Working hours</h2>
      <TimePicker />
    </div>
  );
};

function SettingsPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <BlockList />
    </div>
  );
}

export default SettingsPage;
