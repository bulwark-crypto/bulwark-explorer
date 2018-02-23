export default class Sidebar extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (

      <div className="menu">
        <div className={ `links ${ this.state.isOpen ? 'open' : 'close' }` }>
          <Icon name="menu" /> <Link className="label" to="/">Overview</Link>
          <a onClick={ this.handleToggle }>Menu</a>
          <img src="/public/img/logo.jpg" />
          <div>{ this.state.isOpen ? 'Logo' : 'Icon' }</div>
          <ul>
            <li>
              <Icon name="home" /> <Link className="label" to="/">Overview</Link>
            </li>
            <li>
              <Icon name="home" /> <Link className="label" to="/movement">Movement</Link>
            </li>
            <li>
              <Icon name="home" /> <Link className="label" to="/top">Top 100</Link>
            </li>
            <li>
              <Icon name="home" /> <Link className="label" to="/masternode">Masternodes</Link>
            </li>
            <li>
              <Icon name="home" /> <Link className="label" to="/coin">Coin Info</Link>
            </li>
            <li>
              <Icon name="home" /> <Link className="label" to="/faq">FAQ</Link>
            </li>
            <li>
              <Icon name="home" /> <Link className="label" to="/api">API</Link>
            </li>
          </ul>
        </div>
      </div>
    )
  }
}
