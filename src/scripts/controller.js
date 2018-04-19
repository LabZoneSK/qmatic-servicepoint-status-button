var controller = (function ($) {
  var self = this;
  var wwClient = qmatic.webwidget.client;
  var wwRest = qmatic.connector.client;

  const branchId = wwClient.getBranchId();
  const unitId = wwClient.getUnitId();

  function initializeWidget(widgetConfiguration) {
    const servicePointMI = wwRest.getServicePointData(branchId);
    const openWSP = servicePointMI.filter(function(servicePoint) {
      if (servicePoint.workProfileName) {
        return (servicePoint.workProfileName.indexOf(widgetConfiguration.workprofileMatch) > -1);
      } else {
        return false;
      }
    });

    if(openWSP.length > 0) {
      console.log('There is open workstation matching string ' + widgetConfiguration.workprofileMatch);
      $('.widget-container').click(function(event) {
        wwRest.createVisitByUnitId(unitId, {
          services: [widgetConfiguration.service]
        }, 'LAST');
        wwClient.switchHostPage(widgetConfiguration.ticketRedirectPage, false);
      });
    } else {
      console.log('There is no open workstation matching string ' + widgetConfiguration.workprofileMatch);
      $('.widget-container').click(function(event) {
        wwClient.switchHostPage(widgetConfiguration.closedRedirectPage, false);
      });
    }
  };

  return {
    onLoaded: function (configuration) {
      const attr = configuration.attributes;
      const attribParser = new qmatic.webwidget.AttributeParser(attr || {});

      const widgetConfiguration = {
        closedRedirectPage: attribParser.getString('closed_page'),
        ticketRedirectPage: attribParser.getString('ticket_page'),
        workprofileMatch: attribParser.getString('workprofile_match'),
        service: attribParser.getString('service')
      }

      const imageSrc =  attribParser.getImageUrl('button_img');
      if(imageSrc) {
        $('.widget-container img.button').attr('src', imageSrc);
      }

      initializeWidget(widgetConfiguration);
      setInterval(function () {
        initializeWidget(widgetConfiguration);
      }, 50000);
    },

    onLoadError: function (message) {
      console.error(message);
    }
  };

})(jQuery);