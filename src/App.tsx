import './styles/global.css';
import './App.css';
import { ViewSwitcher } from './components/ViewSwitcher';

function App() {
  return (
    <div className="app">
      <main>
        <ViewSwitcher />
      </main>

      <footer>
        <p>
          <strong>Inhuman Conditions</strong> designed by Tommy Maranges and Cory O'Brien.
          Illustrated by Mac Schubert.
        </p>
        <p>
          Licensed under{' '}
          <a
            href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CC BY-NC-SA 4.0
          </a>
        </p>
        <p>
          <a
            href="https://github.com/anthropics/claude-code"
            target="_blank"
            rel="noopener noreferrer"
          >
            Report Issues
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
