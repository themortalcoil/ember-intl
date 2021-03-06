/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import Ember from 'ember';
import computed from 'ember-new-computed';
import extend from '../utils/extend';

var makeArray = Ember.makeArray;
var observer = Ember.observer;
var runOnce = Ember.run.once;
var get = Ember.get;

function formatterProxy (formatType) {
    return function (value, options = {}) {
        var formatter = this.container.lookup(`ember-intl@formatter:format-${formatType}`);

        if (typeof options.format === 'string') {
            var format = this.getFormat(formatType, options.format);
            options = extend(format, options);
        }

        if (!options.locale) {
            options.locale = get(this, 'locale');
        }

        return formatter.format(value, options);
    };
}

export default Ember.Service.extend(Ember.Evented, {
    locale: null,

    locales: computed({
        get() {
            return get(this, 'locale');
        },
        set(key, value) {
            Ember.Logger.warn('`intl.locales` is deprecated in favor of `intl.locale`');
            this.set('locale', makeArray(value));
            return value;
        }
    }),

    formatRelative: formatterProxy('relative'),
    formatMessage: formatterProxy('message'),
    formatNumber: formatterProxy('number'),
    formatTime: formatterProxy('time'),
    formatDate: formatterProxy('date'),

    adapter: computed(function () {
        return this.container.lookup('ember-intl@adapter:-intl-adapter');
    }).readOnly(),

    formats: computed(function () {
        return this.container.lookup('formats:main', {
            instantiate: false
        }) || {};
    }).readOnly(),

    localeChanged: observer('locale', function () {
        runOnce(this, this.notifyLocaleChanged);
    }),

    addMessage(locale, key, value) {
        return this.translationsFor(locale).then((localeInstance) => {
            return localeInstance.addMessage(key, value);
        });
    },

    addMessages(locale, messageObject) {
        return this.translationsFor(locale).then((localeInstance) => {
            return localeInstance.addMessages(messageObject);
        });
    },

    notifyLocaleChanged() {
        this.trigger('localeChanged');
    },

    createLocale(locale, payload) {
        let name = `ember-intl@translation:${locale}`;
        let container = this.container;
        let instance = container.lookup('application:main');

        if (instance.registry) {
          container = instance.registry;
        }

        let modelType = this.container.lookupFactory('ember-intl@model:translation');

        if (container.has(name)) {
            container.unregister(name);
        }

        container.register(name, modelType.extend(payload));
    },

    getFormat(formatType, format) {
        let formats = get(this, 'formats');

        if (formats && formatType && typeof format === 'string') {
            return get(formats, `${formatType}.${format}`) || {};
        }

        return {};
    },

    translationsFor(locale) {
        let result = get(this, 'adapter').translationsFor(locale);

        return Ember.RSVP.cast(result).then(function (localeInstance) {
            if (typeof localeInstance === 'undefined') {
                throw new Error('\'locale\' must be a string or a locale instance');
            }

            return localeInstance;
        });
    },

    findTranslationByKey(key, locale) {
        locale = locale ? makeArray(locale) : makeArray(get(this, 'locale'));
        let translation = get(this, 'adapter').findTranslationByKey(locale, key);

        if (typeof translation === 'undefined') {
            throw new Error(`translation: '${key}' on locale(s): '${locale.join(',')}' was not found.`);
        }

        return translation;
    }
});
