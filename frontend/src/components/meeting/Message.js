import React, { Component } from "react";

export class Message extends Component {
  render() {
    const { content, owner } = this.props;
    let color;
    if (owner === "them") {
      color = "info";
    } else {
      color = "dark";
    }
    return;
    <div></div>;
  }
}

export default connect()(ChatCard);
