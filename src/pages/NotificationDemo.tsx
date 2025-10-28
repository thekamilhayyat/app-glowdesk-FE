import { AppLayout } from "@/components/layout/AppLayout";
import { Container } from "@/components/ui/Container";
import { BaseButton } from "@/components/base/BaseButton";
import { BaseCard, CardHeader, CardContent } from "@/components/base/BaseCard";
import { notify } from "@/lib/notification";

export function NotificationDemo() {
  const handleSuccessNotification = () => {
    notify.success({
      title: "Success!",
      message: "This is a success notification with custom message."
    });
  };

  const handleWarningNotification = () => {
    notify.warning({
      title: "Warning!",
      message: "This is a warning notification. Please review your action."
    });
  };

  const handleInfoNotification = () => {
    notify.info({
      title: "Information",
      message: "This is an informational notification with helpful details."
    });
  };

  const handleErrorNotification = () => {
    notify.error({
      title: "Error!",
      message: "This is an error notification. Something went wrong."
    });
  };

  const handleCreatedNotification = () => {
    notify.created("User");
  };

  const handleUpdatedNotification = () => {
    notify.updated("Product");
  };

  const handleDeletedNotification = () => {
    notify.deleted("Order");
  };

  const handleConfirmDelete = () => {
    notify.confirmDelete("Client");
  };

  const handleLoadingNotification = () => {
    notify.loading("Data");
  };

  return (
    <AppLayout>
      <Container className="py-4">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-semibold text-foreground">Notification Demo</h1>
          <p className="text-muted-foreground">Test all notification types and features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Notifications */}
          <BaseCard>
            <CardHeader>
              <h3 className="text-lg font-semibold">Basic Notifications</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <BaseButton 
                onClick={handleSuccessNotification}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Success Notification
              </BaseButton>
              <BaseButton 
                onClick={handleWarningNotification}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Warning Notification
              </BaseButton>
              <BaseButton 
                onClick={handleInfoNotification}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Info Notification
              </BaseButton>
              <BaseButton 
                onClick={handleErrorNotification}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Error Notification
              </BaseButton>
            </CardContent>
          </BaseCard>

          {/* Convenience Notifications */}
          <BaseCard>
            <CardHeader>
              <h3 className="text-lg font-semibold">Convenience Methods</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <BaseButton 
                onClick={handleCreatedNotification}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Created Successfully
              </BaseButton>
              <BaseButton 
                onClick={handleUpdatedNotification}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Updated Successfully
              </BaseButton>
              <BaseButton 
                onClick={handleDeletedNotification}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Deleted Successfully
              </BaseButton>
              <BaseButton 
                onClick={handleConfirmDelete}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Confirm Delete
              </BaseButton>
            </CardContent>
          </BaseCard>

          {/* Special Notifications */}
          <BaseCard>
            <CardHeader>
              <h3 className="text-lg font-semibold">Special Features</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <BaseButton 
                onClick={handleLoadingNotification}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Loading Notification
              </BaseButton>
              <BaseButton 
                onClick={() => notify.success({
                  title: "Custom Duration",
                  message: "This notification will stay for 10 seconds",
                  duration: 10
                })}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Custom Duration (10s)
              </BaseButton>
              <BaseButton 
                onClick={() => notify.info({
                  title: "Bottom Left",
                  message: "This notification appears at bottom left",
                  placement: "bottomLeft"
                })}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Bottom Left Placement
              </BaseButton>
              <BaseButton 
                onClick={() => notify.warning({
                  title: "No Auto Close",
                  message: "This notification won't close automatically",
                  duration: 0
                })}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                No Auto Close
              </BaseButton>
            </CardContent>
          </BaseCard>
        </div>

        {/* Usage Examples */}
        <BaseCard className="mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">Usage Examples</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Basic Usage:</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { notify } from "@/lib/notification";

// Success notification
notify.success({
  title: "Success!",
  message: "Operation completed successfully"
});

// Error notification
notify.error({
  title: "Error!",
  message: "Something went wrong"
});`}
                </pre>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Convenience Methods:</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`// Common actions
notify.created("User");
notify.updated("Product");
notify.deleted("Order");
notify.confirmDelete("Client");`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Advanced Options:</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`notify.success({
  title: "Custom",
  message: "Custom message",
  duration: 10, // seconds
  placement: "bottomLeft", // topLeft, topRight, bottomLeft, bottomRight
  className: "custom-class"
});`}
                </pre>
              </div>
            </div>
          </CardContent>
        </BaseCard>
      </Container>
    </AppLayout>
  );
} 