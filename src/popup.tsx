function IndexPopup() {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>
        Welcome to focus bear <a href="/tabs/settings-page.html">Settings inline</a>
      </h1>
      <button onClick={() => { chrome.tabs.create({ url: "/tabs/settings-page.html" }) }}> Settings page</button>
    </div>
  )
}

export default IndexPopup
