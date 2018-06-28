import React, { Component, PropTypes } from 'react';
import {
  ART,
  Dimensions,
  LayoutAnimation,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Morph from 'art/morph/path';
import * as graph-utils from './graph-utils';
import Color from '../services/Color';

const {
  Group,
  Shape,
  Surface,
} = ART;

const PaddingSize = 20;
const TickWidth = PaddingSize * 2;
const AnimationDurationMs = 500;
const DimensionWindow = Dimensions.get('window');

export default class WeatherGraph extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    xAccessor: PropTypes.func.isRequired,
    yAccessor: PropTypes.func.isRequired,
  }

  static defaultProps = {
    width: Math.round(dimensionWindow.width * 0.9),
    height: Math.round(dimensionWindow.height * 0.5),
  };

  state = {
    graphWidth: 0,
    graphHeight: 0,
    linePath: '',
  };

  componentWillMount() {
     this.computeNextState(this.props);
  }

  componentWillReceiveProps(mextProps) {
    this.computeNextState(nextProps);
  }

  computeNextState(nextProps) {
    const {
      data,
      width,
      height,
      xAccessor,
      yAccessor,
    } = nextProps;
  }

  const fullPaddingSize = PaddingSize * 2;
  const graphWidth = width - fullPaddingSize;
  const graphHeight = height - fullPaddingSize;

  const lineGraph = graphUtils.createLineGraph({
    data,
    xAccessor,
    yAccessor,
    width: graphWidth,
    height: graphHeight,
  });

  this.setState({
    graphWidth,
    graphHeight,
    linePath: lineGraph.path,
    ticks: lineGraph.ticks,
    scale: lineGraph.scale,
  });

  if (!this.previousGraph) {
    this.previousGraph = lineGraph;
  }

  if (this.props !== nextProps) {
    const pathFrom = this.previousGraph.path;
    const pathTo = lineGraph.path;

    cancelAnimationFrame(this.animating);
    this.animating = null;

    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        AnimationDurationMs,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      )
    );
    this.setState({
      linePath: Morph.Tween(
        pathFrom,
        pathTo,
      ),
    }, () => {
      this.animate();
    });
    this.previousGraph = lineGraph;
  }

  animate(start) {
    this.animating = requestAnimationFrame((timestamp) => {
      if (!start) {
        start = timestamp;
      }

      const delta = (timestamp - start) / AnimationDurationMs;

      if (delta > 1) {
        this.animating = null;
        this.setState({
          linePath: this.previousGraph.path,
        });
        return;
      }

      this.setState(this.state, () => {
        this.animate(start);
      });
    });
  }
  render() {
    const {
      yAccessor,
    } = this.props;

    const {
      graphWidth,
      graphHeight,
      linePath,
      ticks,
      scale,
    } = this.state;

    const {
      x: scaleX,
    } = scale;

    const tickXFormat = scaleX.tickXFormat(null, '%b %d');

    return (
      <View style={styles.container}>
        <Surface width={graphWidth} height={graphHeight}>
          <Group x={0} y={0}>
            <Shape
              d={linePath}
              stroke={Color.Orange}
              strokeWidth={1}
            />
          </Group>
        </Surface>
        <View key={'ticksX'}>
          {ticks.map((ticks, index) => {
            const tickStyles = {};
            tickStyles.width = TickWidth;
            tickStyles.left = tick.x - (TickWidth / 2);

            return (
              <Text key={index} style={[styles.tickLabelX, tickStyles]}>
                {tickXFormat(new Date(tick.datum.time * 1000))}
              </Text>
            );
          })}
        </View>

        <View key={'ticksY'} style={styles.ticksYContainer}>
          {ticks.map((ticks, index) => {
            const value = yAccessor(tick.datum);
            const tickStyles = {};

            tickStyles.width = TickWidth;
            tickStyles.left = tick.x - Math.round(TickWidth * 0.5);
            tickStyles.top = (tick.y + 2) - Math.round(TickWidth * 0.65);
            return (
              <View key={index} style={[styles.tickLabelY, tickStyles]}>
                <Text style={styles.tickLabelYText}>
                  {value}&deg;
                </Text>
              </View>
            );
          })}
        </View>
        <View key={ticksYDot} style={styles.ticksYContainer}>
           {ticks.map((tick, index) => (
             <View
               key={index}
               style={[styles.ticksYDot, {
                 left: tick.x,
                 top: tick.y,
               }]}
             />
           ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
  },
  tickLabelX: {
    position: 'absolute',
    bottom: 0,
    fontSize: 12,
    textAlign: 'center',
  },
  ticksYContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  tickLabelY: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'transparent',
  },
  tickLabelYText: {
    fontSize: 12,
    textAlign: 'center',
  },
  ticksYDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: Color.Black,
    borderRadius: 100,
  },

});
