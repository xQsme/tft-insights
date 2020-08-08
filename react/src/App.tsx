import React, {Component} from 'react';
import server from './constants/server';
import './assets/styles/main.scss';
import { Scrollbars } from 'react-custom-scrollbars';
import axios from 'axios';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SpecialTable from './components/special_table';
import Button from '@material-ui/core/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AppState {
  requested: boolean,
  units: any,
  totalMatches: number,
  value: number,
  error: boolean,
}

class App extends Component <{}, AppState> {
  constructor(props: object) {
    super(props);
    this.state = {
        requested: false,
        units: [],
        totalMatches: 1,
        value: 0,
        error: false,
    };
  }

  componentDidMount() { 
    this.requestUnits(undefined);
  }

  requestUnits = (item: any) => {
    const { value } = this.state;
    axios.get(server + '/tft/units/' + (item ? item : value)).then(response => {
      //console.log(response.data);
      this.setState({...response.data, requested: true});
    }).catch(error => {
      this.setState({error: true});
      if(error && error.response && error.response.status === 403) {
        toast('❌ API Key Expired!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast('❌ Request Limit Reached!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }

    });
  }

  handleChange = (stuff: any, item: number) => {
    this.setState({value: item, requested: false, error: false});
    this.requestUnits(item);
  }

  render() { 
    const { requested, units, totalMatches, value, error } = this.state;
    
    return(
      <div className="App">
        <ToastContainer />
        <Scrollbars
          autoHide
          className="scrollbar"
          renderTrackHorizontal={props => <div {...props} className="track-horizontal" />}
          renderTrackVertical={props => <div {...props} className="track-vertical" />}
          renderThumbHorizontal={props => <div {...props} className="thumb-horizontal" />}
          renderThumbVertical={props => <div {...props} className="thumb-vertical" />}
        >
          <div className="app-container">
            <h3 className="center">TFT Insights</h3>
            <Tabs
              value={value}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="EU" />
              <Tab label="NA" />
              <Tab label="KR" />
            </Tabs>
            {error ? (
              <div className="full-width">
                <Button className="btn-main" variant="contained" color="primary" onClick={() => {this.setState({error: false, requested: false}); this.requestUnits(undefined);}}>Retry Request</Button>
                <p className="note">Request limit reached, please wait a bit before retrying.</p>
              </div>
            ) : (
              <>
                {!requested ? (
                  <div className="center"><div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div>
                ) : (
                  <>
                    <SpecialTable 
                      rows={units} 
                      headers={['Unit', '1st Place' , 'Top 4', 'Items']}
                      elements={['unit', 'win', 'top', 'items']}
                      primaryKey={"Unit"}
                      orderCol="1st Place"
                      orderDir="desc"
                      rowCount={15}/>
                    <p className="note">Data recovered from {totalMatches} of the latest matches of the top Challenger players of the selected region.</p>
                  </>
                )}
              </>
            )}
          </div>
        </Scrollbars>
      </div>
    );
  }
}

export default App;
