export const Wrapper = props => {
    return <>
        {/* TOP NAVBAR */}
        <header className="top-navbar">
            <div className="navbar-title">
                <img src="/logo.svg" alt="StockNest logo" style={{ width: 32, height: 32, marginRight: 10, verticalAlign: 'middle' }} />
                StockNest
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