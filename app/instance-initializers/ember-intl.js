/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import ENV from '../config/environment';
import addLocaleData from 'ember-intl/utils/add-locale-data';
import { filterBy } from 'ember-intl/utils/initialize';

export function instanceInitializer(instance) {
    let service = instance.container.lookup('service:intl');

    filterBy(ENV, 'cldrs').forEach((key) => {
        addLocaleData(require(key, null, null, true)['default']);
    });

    filterBy(ENV, 'translations').forEach((key) => {
        let localeSplit = key.split('\/');
        let locale = localeSplit[localeSplit.length - 1];
        service.createLocale(locale, require(key, null, null, true)['default']);
    });
}

export default {
  name: 'ember-intl',
  initialize: instanceInitializer
}
