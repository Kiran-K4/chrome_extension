import fblogo from "data-base64:/assets/fblogo.svg"
import "./splash-style.css"

function SplashPage() {
    return (
        <div
            style={{
                marginTop: "15%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 16
            }}>
            <img className="fblogo" src={fblogo} />
            <div className="decorator">
                <h1>Not yet...✋</h1>
            </div>

            <p>Try focusing on your work, that way you will be finished earlier!🐻 If you wish to unblock this page, remove it from the <a href="/tabs/settings-page.html">blocked list</a>.</p>
        </div>
    )
}

export default SplashPage