import Implementation = require('./')
import test = require('@fanny-pack/test')
import createTestRunner = require('@fanny-pack/test/build/runner')

test(new Implementation(), createTestRunner())
