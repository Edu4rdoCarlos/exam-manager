'use strict';

const { EventEmitter } = require('events');

class MockPdfDocument extends EventEmitter {
  end() {
    const minimalPdf = Buffer.from('%PDF-1.4 mock pdf content for testing\n%%EOF\n');
    process.nextTick(() => {
      this.emit('data', minimalPdf);
      this.emit('end');
    });
  }
}

class MockPrinter {
  createPdfKitDocument() {
    return new MockPdfDocument();
  }
}

module.exports = MockPrinter;
