export const Wrapper = props => {
    return <>
        {/* TOP NAVBAR */}
        <header className="top-navbar">
            <div className="navbar-title">Company name</div>
        </header>

    {/* PAGE LAYOUT */}
        <div className="layout">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-item active">Product</div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="content">
                {props.children}
            </main>

        </div>
    </>
}