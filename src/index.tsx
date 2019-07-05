import React from 'react';
import ReactDOM from 'react-dom';
import {
    createStore,
    combineReducers,
    applyMiddleware,
    AnyAction
} from 'redux';
import { Provider, connect } from 'react-redux';

import { createBrowserHistory } from 'history';

import {
    createRoutingMiddleware,
    RouterConfig,
    createRoutingReducer,
    RouterLocation,
    Link,
    AdvancedLink,
    RouterContext
} from 'direct-react-router';

import { composeWithDevTools } from 'redux-devtools-extension';

// configuration
const history = createBrowserHistory();

const config: RouterConfig = {
    routes: {
        PAGE1: '/page1',
        PAGE2: '/page2/:id',
        ROOT: '/',
    }
};

// middleware
const routingMiddleware = createRoutingMiddleware(config, history);

// reducer
interface AppState {
    location: RouterLocation;
}

const rootReducer = combineReducers({
    location: createRoutingReducer(config, history.location)
});

// store
const store = createStore<AppState, AnyAction, {}, {}>(
    rootReducer,
    composeWithDevTools(applyMiddleware(routingMiddleware))
);

interface RootProps {
    location: RouterLocation;
}

class Root extends React.Component<RootProps> {
    render() {
        const {key, params} = this.props.location;
        let content = <div>404</div>;

        switch (key) {
            case 'ROOT':
                content = <div>ROOT</div>;
                break;
            case 'PAGE1':
                content = <div>PAGE1</div>;
                break;
            case 'PAGE2':
                content = <div>PAGE2, id: {params.id}</div>;
                break;
        }

        return <>
            <header>
                <Link href='/'>root</Link> | 
                <Link href='/page1'>page1</Link> | 
                <Link href='/page2/test'>page2</Link> |
                <AdvancedLink routeKey='PAGE2' params={{ id: 'moo' }} >another page2</AdvancedLink> |
                <Link href='/nonexistent'>nonexistent page</Link>
            </header>
            {content}
        </>;
    }
}

function mapStateToProps(state: AppState): RootProps {
    return {
        location: state.location
    };
}

const ConnectedRoot = connect<RootProps, {}, {}, AppState>(mapStateToProps)(Root);

class TestApplication extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <RouterContext.Provider value={{ config }}>
                    <ConnectedRoot />
                </RouterContext.Provider>
            </Provider>
        );
    }
}

ReactDOM.render(<TestApplication />, document.getElementById('root'));
