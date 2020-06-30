import React, {  Fragment } from "react";
import { Tab, Tabs } from "react-bootstrap";
import ChatCard from "./ChatCard";
import About from "./About";
import "../../App.css";

const CurrentMeeting = props => {
    return (
      <Fragment>
        <div
          className="card-scaled card text-white bg-white"
          data-test="meeting"
        >
          <Tabs defaultActiveKey="about">
            <Tab eventKey="about" title="About your match">
              <About {...this.props} />
            </Tab>
            <Tab eventKey="profile" title="Chat">
              <ChatCard firstName={this.props.firstName} />
            </Tab>
          </Tabs>
        </div>
      </Fragment>
    );
};

export default CurrentMeeting;