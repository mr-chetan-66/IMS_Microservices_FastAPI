export const Wrapper = props => {
    return <>
        {/* TOP NAVBAR */}
        <header className="top-navbar">
            <div className="navbar-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src="/logo.svg" alt="StockNest logo" style={{ width: 46, height: 46, objectFit: 'contain' }} />
                <span>StockNest</span>
            </div>
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