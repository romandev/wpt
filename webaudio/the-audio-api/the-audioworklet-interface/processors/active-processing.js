/**
 * @class ActiveProcessingTester
 * @extends AudioWorkletProcessor
 *
 * This processor class sends a message to its AudioWorkletNodew whenever the
 * number of channels on the input changes.  The message includes the actual
 * number of channels, the context time at which this occurred, and whether
 * we're done processing or not.
 */
class ActiveProcessingTester extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this._lastChannelCount = 0;
    this.port.onmessage = this.handleMessage_.bind(this);

    // See if user specified a value for test duration.
    if (options.hasOwnProperty('processorOptions') &&
        options.processorOptions.hasOwnProperty('testDuration')) {
      this._testDuration = options.processorOptions.testDuration;
    } else {
      this._testDuration = 5;
    }

    // Time at which we'll signal we're done, based on the requested
    // |testDuration|
    this._endTime = currentTime + this._testDuration;
  }

  handleMessage_(event) {
    // We don't expect any messages from the worklet node.
  }

  process(inputs, outputs) {
    let input = inputs[0];
    let output = outputs[0];
    let inputChannelCount = input.length;
    let finished = currentTime > this._endTime;

    if (finished || (inputChannelCount != this._lastChannelCount)) {
      this.port.postMessage({
        channelCount: inputChannelCount,
        finished: finished,
        time: currentTime
      });
      this._lastChannelCount = inputChannelCount;
    }

    // Just copy the input to the output for no particular reason.
    for (let channel = 0; channel < input.length; ++channel) {
      output[channel].set(input[channel]);
    }

    return true;
  }
}

registerProcessor('active-processing-tester', ActiveProcessingTester);
