import React, { useState, useEffect } from "react";
import { Switch, Route, Link, useRouteMatch } from "react-router-dom";
import PrivateRoute from "../common/PrivateRoute";
import EditForm from "../auth/ChangePasswordForm";
import Matcher from "../matcher/Matcher";
import TagsForm from "./tags/TagsForm";
import PreviousMatches from "../previous_meeting/PreviousMatches";
import {
  askForMatch,
  endMeeting,
  saveMatchClient,
} from "../../actions/matcher";
import { connect } from "react-redux";
import MatchClient from "../../services/MatchClient";
import { createMessage, MESSAGE_ERROR } from "../../actions/messages";
import { newMessage, setMessages } from "../../actions/chat";

function MainPanel(props) {
  let match = useRouteMatch();
  const [showTagsForm, setShowTagsForm] = useState(false);
  const [askedForMatch, setAskedForMatch] = useState(false);

  useEffect(() => {
    if (!askedForMatch) {
      setAskedForMatch(true);
      props.askForMatch();
      if (MatchClient.connect() === false) {
        props.createMessage(
          MESSAGE_ERROR,
          "unable to establish update connection with server"
        );
      } else {
        MatchClient.waitForSocketConnection(() => {
          MatchClient.addCallback({
            match_created: props.askForMatch,
            match_terminated: props.askForMatch,
            new_message: props.newMessage,
            messages: props.setMessages,
          });
          props.saveMatchClient(MatchClient);
        });
      }
    }
  }, [askedForMatch, props]);

  return (
    <div>
      <Switch>
        <PrivateRoute
          path={`${match.path}change_password`}
          component={EditForm}
        />
        <PrivateRoute path={`${match.path}matcher`} component={Matcher} />
        <PrivateRoute
          path={`${match.path}previous-matches`}
          component={PreviousMatches}
        />
        <Route path={match.path}>
          <TagsForm show={showTagsForm} onHide={() => setShowTagsForm(false)} />
          <div className="border-top my-5"></div>
          <div className="container ">
            <div className="column">
              {props.currentMatch ? (
                <div></div>
              ) : (
                <div className="col-lg">
                  <div className="jumbotron card">
                    <div className="card-header">
                      <h1>What do you wanna do today?</h1>
                    </div>
                    <div className="card-body">
                      <h4 className="card-title">Change your tags</h4>
                      <p className="card-text">
                        Click on the button and change your tags in order to
                        find company for today
                      </p>
                      <button
                        className="btn btn-info btn-lg"
                        onClick={() => setShowTagsForm(true)}
                      >
                        <i className="fas fa-clone left"></i> Set tags!
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="col-lg">
                <div className="jumbotron card">
                  <div className="card-header">
                    <h1>
                      {props.currentMatch
                        ? "You have a match!"
                        : "Match with people you share interests with"}
                    </h1>
                  </div>
                  <div className="card-body">
                    <h4 className="card-title">
                      {props.currentMatch
                        ? "Go and talk to them!"
                        : "Match with people you share interests with"}
                    </h4>
                    <p className="card-text">
                      {props.currentMatch
                        ? "Click on the button and start your chat, they surely can't wait! Maybe it's them who will make your plan for today?"
                        : "Click on the button and start looking for people around you! Maybe one of them is your plan for today?"}
                    </p>
                    <Link to="/matcher" className="btn btn-primary btn-lg">
                      <i className="fas fa-clone left"></i>{" "}
                      {props.currentMatch
                        ? "Go to your match!"
                        : "Find people nearby!"}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg">
                <div className="jumbotron card">
                  <div className="card-header">
                    <h1>Need to update?</h1>
                  </div>
                  <div className="card-body">
                    <h4 className="card-title">
                      Change your name, email or password
                    </h4>
                    <Link
                      to="/update-details"
                      className="btn btn-secondary btn-lg"
                    >
                      <i className="fas fa-clone left"></i> Edit profile!
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg">
                <div className="jumbotron card">
                  <div className="card-header">
                    <h1>Previous Matches!</h1>
                  </div>
                  <div className="card-body">
                    <h4 className="card-title">
                      Go and talk to your previous matches, maybe today they're
                      free too?
                    </h4>
                    <Link
                      to="/previous-matches"
                      className="btn btn-info btn-lg"
                    >
                      <i className="fas fa-clone left"></i> Browse previous
                      matches!
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
}

const mapStateToProps = (state) => ({
  currentMatch: state.getIn(["matcher", "currentMatch"]),
});

export default connect(mapStateToProps, {
  askForMatch,
  endMeeting,
  saveMatchClient,
  createMessage,
  setMessages,
  newMessage,
})(MainPanel);
