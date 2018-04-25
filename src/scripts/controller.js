var controller = (function ($) {
  var self = this;
  var wwClient = qmatic.webwidget.client; //Qmatic Widget Client
  var wwRest = qmatic.connector.client; //Qmatic REST Client

  const branchId = wwClient.getBranchId(); //Holds ID of current branch
  const unitId = wwClient.getUnitId(); //Holds ID of current unit

  var delaying = false;

  /**
   * Creates visit for selected service.
   * 
   * @param {Object} widgetConfiguration Widget configuration parameters
   */
  function printTicket(widgetConfiguration) {
    if (!delaying) {
      delaying = true;
      wwRest.createVisitByUnitId(unitId, {
        services: [widgetConfiguration.service]
      }, 'LAST');
      setTimeout(
        function () {
          delaying = false;
        },
        10000
      );
    }
  }

  /**
   * Initialize widget and add event handler
   * 
   * @param {Object} widgetConfiguration Widget configuration parameters
   */
  function initializeWidget(widgetConfiguration) {
    const servicePointMI = wwRest.getServicePointData(branchId);

    const widgetContainer = $('.widget-container');

    const openWSP = servicePointMI.filter(function (servicePoint) {
      if (servicePoint.workProfileName) {
        return (servicePoint.workProfileName.indexOf(widgetConfiguration.workprofileMatch) > -1);
      } else {
        return false;
      }
    });

    if (openWSP.length > 0) {
      console.log('There is open workstation matching string ' + widgetConfiguration.workprofileMatch);

      $('.widget-container').unbind();
      $('.widget-container').bind('click', function (event) {
        widgetContainer.css('display', 'none');
        printTicket(widgetConfiguration);
        wwClient.switchHostPage(widgetConfiguration.ticketRedirectPage, false);

        setTimeout(function () {
          $('.widget-container').css('display', 'block');
        }, 5000);
      });
    } else {
      console.log('There is no open workstation matching string ' + widgetConfiguration.workprofileMatch);
      $('.widget-container').unbind();
      $('.widget-container').bind('click', function (event) {
        wwClient.switchHostPage(widgetConfiguration.closedRedirectPage, false);
      });
    }
  };

  return {
    onLoaded: function (configuration) {
      const attr = configuration.attributes;
      const attribParser = new qmatic.webwidget.AttributeParser(attr || {});

      //Create configuration object for this widget
      const widgetConfiguration = {
        closedRedirectPage: attribParser.getString('closed_page'),
        ticketRedirectPage: attribParser.getString('ticket_page'),
        workprofileMatch: attribParser.getString('workprofile_match'),
        service: attribParser.getString('service')
      }

      //Set image for this widget
      const imageSrc = attribParser.getImageUrl('button_img');
      if (imageSrc) {
        $('.widget-container img.button').attr('src', imageSrc);
      }

      initializeWidget(widgetConfiguration);

      //Refresh widget every 50 seconds
      setInterval(function () {
        initializeWidget(widgetConfiguration);
      }, 50000);
    },

    onLoadError: function (message) {
      console.error(message);
    }
  };

})(jQuery);