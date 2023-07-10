import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage";

import "./settings-style.css"

const BlockList = () => {
    console.log("boom");
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
            <h2>Blocked List</h2>
            <div>
                <input
                    type="text"
                    value={newPage}
                    onChange={(e) => setNewPage(e.target.value)}
                />
                <button onClick={handleAddPage}>Add Page to Blocked ⛔</button>
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 16
                }}>
                {blockedPages.map((page, index) => (
                    <div key={index}>{page}
                        <button onClick={() => handleDeletePage(index)}>❌</button>
                    </div>
                ))}
            </div>
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
    )
}

export default SettingsPage