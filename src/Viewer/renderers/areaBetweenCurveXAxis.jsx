import React from 'react';
import DoenetRenderer from './DoenetRenderer';

export default class AreaBetweenCurveXAxis extends DoenetRenderer {
  constructor(props) {
    super(props)


    if (props.board) {
      this.createGraphicalObject();

    }
  }

  static initializeChildrenOnConstruction = false;


  createGraphicalObject() {

    if (!this.doenetSvData.haveFunction || this.doenetSvData.boundaryValues.length !== 2 ||
      !this.doenetSvData.boundaryValues.every(Number.isFinite)
    ) {
      return;
    }

    this.jsxAttributes = {
      name: this.doenetSvData.label,
      visible: !this.doenetSvData.hidden,
      withLabel: this.doenetSvData.showLabel && this.doenetSvData.label !== "",
      fixed: true,
      layer: 10 * this.doenetSvData.layer + 7,

      // TODO: use more appropriate style attribute
      fillColor: this.doenetSvData.selectedStyle.lineColor,
      highlight: false,

      curveLeft: { visible: false },
      curveRight: { visible: false }
    };

    this.curveJXG = this.props.board.create('functiongraph', this.doenetSvData.function, { visible: false });

    this.integralJXG = this.props.board.create('integral', [this.doenetSvData.boundaryValues, this.curveJXG], this.jsxAttributes);


    return this.integralJXG;


  }

  deleteGraphicalObject() {
    this.props.board.removeObject(this.integralJXG);
    delete this.integralJXG;

    this.props.board.removeObject(this.curveJXG);
    delete this.curveJXG;
  }

  componentWillUnmount() {
    if (this.integralJXG) {
      this.deleteGraphicalObject();
    }
  }


  update() {

    if (!this.props.board) {
      this.forceUpdate();
      return;
    }

    if (!this.doenetSvData.haveFunction || this.doenetSvData.boundaryValues.length !== 2 ||
      !this.doenetSvData.boundaryValues.every(Number.isFinite)
    ) {
      if (this.integralJXG) {
        return this.deleteGraphicalObject();
      } else {
        return;
      }
    }

    if (this.integralJXG === undefined) {
      return this.createGraphicalObject();
    }

    let [x1, x2] = this.doenetSvData.boundaryValues;
    let [y1, y2] = this.doenetSvData.boundaryValues.map(this.doenetSvData.function)
    this.integralJXG.curveLeft.coords.setCoordinates(JXG.COORDS_BY_USER, [x1, y1]);
    this.integralJXG.curveRight.coords.setCoordinates(JXG.COORDS_BY_USER, [x2, y2]);


    this.integralJXG.curveLeft.needsUpdate = true;
    this.integralJXG.curveLeft.update();

    this.integralJXG.curveRight.needsUpdate = true;
    this.integralJXG.curveRight.update();

    this.props.board.updateRenderer();


  }


  render() {

    if (this.props.board) {
      return <><a name={this.componentName} /></>
    }

    if (this.doenetSvData.hidden) {
      return null;
    }

    // don't think we want to return anything if not in board
    return <><a name={this.componentName} /></>
  }

}