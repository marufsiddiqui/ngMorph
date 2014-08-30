angular.module('morph.directives')
.directive('ngMorphModal', ['$http', '$templateCache', '$compile', 'Morph', function ($http, $templateCache, $compile, Morph) {
  var isMorphed = false;

  return {
    restrict: 'A',
    scope: {
      settings: '=ngMorphModal'
    },
    link: function (scope, element, attrs) {
      var loadContent = $http.get(scope.settings.template.url, { cache: $templateCache });
      var wrapper     = angular.element('<div></div>').css('visibility', 'hidden');

      var compile = function (results) {
        if ( results ) scope.morphTemplate = results.data;

        return $compile(scope.morphTemplate)(scope);    
      };

      var toggle = function (modal, elements) {
        scope.settings.MorphableBoundingRect = element[0].getBoundingClientRect();

        if ( !isMorphed ) {
          wrapper.css({
            transition: 'none', // remove any transitions to prevent the relocation from being delayed.
            top: scope.settings.MorphableBoundingRect.top + 'px',
            left: scope.settings.MorphableBoundingRect.left + 'px'
          });

          setTimeout( function () {
            angular.forEach(elements, function (element, elementName) {
              modal.addClass(element, elementName, scope.settings);
            });
          }, 25 );
        } else {
          angular.forEach(elements, function (element, elementName) {
            modal.removeClass(element, elementName, scope.settings);
          });
        }

        isMorphed = !isMorphed;
      };

      loadContent.then(compile)
      .then( function (content) {
        var closeEl  = angular.element(content[0].querySelector(scope.settings.closeEl));
        var elements = {
          morphable: element,
          wrapper: wrapper,
          content: content
        };

        // add to dom
        wrapper.append(content);
        element.after(wrapper);

        // get bounding rectangles
        scope.settings.MorphableBoundingRect = element[0].getBoundingClientRect();
        scope.settings.ContentBoundingRect = content[0].getBoundingClientRect();
        
        // bootstrap the modal
        var modal = Morph.modal(elements, scope.settings);
        
        // attach event listeners
        element.bind('click', function () {
          toggle(modal, elements);
          // modal.toggle(modal, elements);
        });

        if ( closeEl ) {
          closeEl.bind('click', function (event) {
            toggle(modal, elements);
            // modal.toggle(modal, elements);
          });
        }

        // remove event handlers when scope is destroyed
        scope.$on('$destroy', function () {
          element.unbind('click');
          closeEl.unbind('click');
        });
      });

    }
  };
}]);