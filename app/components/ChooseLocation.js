import React, { Component, PropTypes } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Navigator,
  Dimensions,
  TouchableHighlight
} from 'react-native';

import {
  MKColor,
} from 'react-native-material-kit';

import TopBar from './TopBar';
import MapView from 'react-native-maps';

import configURL from './../config/config.js';
import eventBus from '../util/eventBus';

const styles = StyleSheet.create({
  map: {
    height: Dimensions.get('window').height - 60,
  },
  locationView: {
    backgroundColor: '#fff',
    flex: 1
  }
});

export default class ChooseLocation extends Component {
  static propTypes = {
    navigator: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    mongoLocation: PropTypes.array.isRequired,
    friends: PropTypes.array.isRequired,
    handleCoordsSet: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      loadReady: false,
      coords: {
        latitude: this.props.mongoLocation[1] + 0.0005,
        longitude: this.props.mongoLocation[0] + 0.0005
      }
    };

    this.setPinCoords = this.setPinCoords.bind(this);
    this.handleDone = this.handleDone.bind(this);
    this.loadMap = this.loadMap.bind(this);
  }

  componentWillMount() {
    // This event is triggered every time Navigator.onDidFocus
    // is called
    this.unsubscribeFocus = eventBus.on('navigatorFocus', this.loadMap);
  }

  componentWillUnmount() {
    // Unsubscribe so that this.loadMap is not called every
    // time in the future when the event we're interested in
    // fires. Without an unsubscribe, we get an error because
    // the function loadMap gets called after this component
    // is erased, and thus the this context will be messed up
    this.unsubscribeFocus();
  }

  loadMap() {
    this.setState({
      loadReady: true
    });
  }

  setPinCoords(coords) {
    this.setState({
      coords: {
        latitude: coords.latitude,
        longitude: coords.longitude
      }
    });
    return;
  }

  handleDone() {
    this.props.handleCoordsSet(this.state.coords);
    this.props.navigator.pop();
  }

  render () {
    return (
      <View style={styles.locationView}>
        <TopBar
          topBarName="Set Event Location"
          handleLeftPress={this.handleDone}
          iconName="arrow-back"
        />
        {
          this.state.loadReady ?
          (<MapView
            onRegionChangeComplete={this.setPinCoords}
            showsUserLocation={true}
            style={styles.map}
            initialRegion={{
              latitude: this.props.mongoLocation[1],
              longitude: this.props.mongoLocation[0],
              latitudeDelta: .04,
              longitudeDelta: .02
            }}
          >
            <MapView.Marker
              coordinate={this.state.coords}
              pinColor='yellow'
              title='The location of your next event!'
            />

            {
              this.props.friends.map(friend => {
                var tempLoc = {
                  latitude: friend.location[1],
                  longitude: friend.location[0]
                };

                return (
                  <MapView.Circle
                    key={friend._id}
                    center={tempLoc}
                    fillColor={MKColor.Indigo}
                    strokeColor={MKColor.Indigo}
                    radius={50}
                  >
                  </MapView.Circle>
                );
              })
            }
          </MapView>
          ) :
          null
        }

      </View>
    );
  }
}
