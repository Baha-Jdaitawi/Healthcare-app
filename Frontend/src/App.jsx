import { BrowserRouter } from 'react-router-dom';
import { GlobalProvider } from './context/GlobalContext.js';
import AppRouter from './router/index.js';
import './styles/globals.css';
import './App.css';

function App() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <div className="App">
          <AppRouter />
        </div>
      </BrowserRouter>
    </GlobalProvider>
  );
}

export default App;
