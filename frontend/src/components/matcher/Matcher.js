import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Geolocator from "./Geolocator";
import { getGeolocation } from "../../actions/geolocation";
import { createMessage, MESSAGE_ERROR } from "../../actions/messages";
import ActualMatcher from "./ActualMatcher";
import { askForMatch } from "../../actions/matcher";

import WebSocketClient from "../../services/WebSocketClient";

export class Matcher extends Component {
  constructor(props) {
    super(props);

    if (WebSocketClient.connect() === false) {
      this.props.createMessage(
        MESSAGE_ERROR,
        "unable to establish update connection with server"
      );
    } else {
      WebSocketClient.waitForSocketConnection(() => {
        WebSocketClient.addCallback(this.props.askForMatch);
        console.log(
          "To funkcja ktora przekazuje do modulu obslugujacego polaczenia, wywola sie kiedy uda mi sie je nawiazac"
        );
      });
    }
  }
  static propTypes = {
    getGeolocation: PropTypes.func.isRequired,
    createMessage: PropTypes.func.isRequired,
    coords: PropTypes.object.isRequired,
    timestamp: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    accepted: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    if (this.props.timestamp === -1) {
      this.props.getGeolocation();
    }
  }

  render() {
    const { accepted, isLoading } = this.props;

    const whenLoading = (
      <Fragment>
        <div className="border-top my-5" data-test="loading"></div>
        <h1>Loading...</h1>
      </Fragment>
    );

    const whenNotAccepted = (
      <Fragment>
        <div className="border-top my-5" data-test="not-accepted"></div>
        <Geolocator />
      </Fragment>
    );

    const whenAccepted = (
      <Fragment>
        <div className="border-top my-5" data-test="accepted"></div>
        <ActualMatcher />
      </Fragment>
    );

    let currentView = {};
    if (isLoading) {
      currentView = whenLoading;
    } else if (!isLoading && accepted === true) {
      currentView = whenAccepted;
    } else {
      currentView = whenNotAccepted;
    }

    return <Fragment>{currentView}</Fragment>;
  }
}

const mapStateToProps = (state) => ({
  coords: state.getIn(["geolocation", "coords"]),
  timestamp: state.getIn(["geolocation", "timestamp"]),
  isLoading: state.getIn(["geolocation", "isLoading"]),
  accepted: state.getIn(["geolocation", "accepted"]),
});

export default connect(mapStateToProps, {
  askForMatch,
  getGeolocation,
  createMessage,
})(Matcher);
